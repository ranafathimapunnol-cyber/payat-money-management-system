# members/views_api.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Member, PayatEvent, Transaction, TransactionApproval
from .serializers import (
    MemberSerializer, TransactionSerializer, PayatEventSerializer,
    BalanceSerializer, TransactionApprovalSerializer
)

class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Member.objects.all()
    
    @action(detail=True, methods=['get'])
    def balance_with_user(self, request, pk=None):
        """Get balance between current user and a specific member"""
        member = self.get_object()
        current_member = request.user.member_profile
        
        given = Transaction.objects.filter(
            member=current_member,
            related_member=member,
            type='given',
            is_verified=True
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        received = Transaction.objects.filter(
            member=current_member,
            related_member=member,
            type='received',
            is_verified=True
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            'member': MemberSerializer(member).data,
            'given': given,
            'received': received,
            'balance': received - given
        })
    
    @action(detail=False, methods=['get'])
    def balances(self, request):
        """Get all balances for current user"""
        current_member = request.user.member_profile
        
        # Get all members this user has transacted with
        related_members = Member.objects.filter(
            Q(transactions__member=current_member) |
            Q(related_transactions__member=current_member)
        ).distinct()
        
        balances = []
        for member in related_members:
            if member.id != current_member.id:
                given = Transaction.objects.filter(
                    member=current_member,
                    related_member=member,
                    type='given',
                    is_verified=True
                ).aggregate(Sum('amount'))['amount__sum'] or 0
                
                received = Transaction.objects.filter(
                    member=current_member,
                    related_member=member,
                    type='received',
                    is_verified=True
                ).aggregate(Sum('amount'))['amount__sum'] or 0
                
                balances.append({
                    'member': MemberSerializer(member).data,
                    'given': given,
                    'received': received,
                    'balance': received - given
                })
        
        return Response(BalanceSerializer(balances, many=True).data)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user.member_profile
        return Transaction.objects.filter(
            Q(member=user) | Q(related_member=user)
        ).order_by('-transaction_date')
    
    def create(self, request, *args, **kwargs):
        """Create a transaction with two-way verification"""
        data = request.data
        member = request.user.member_profile
        related_member = get_object_or_404(Member, id=data.get('related_member'))
        event = PayatEvent.objects.filter(id=data.get('event')).first()
        
        # Create transaction (unverified)
        transaction = Transaction.objects.create(
            member=member,
            related_member=related_member,
            amount=data.get('amount'),
            type=data.get('type'),
            event=event,
            note=data.get('note', ''),
            is_verified=False
        )
        
        # Create approval records
        TransactionApproval.objects.create(
            transaction=transaction,
            member=member,
            is_approved=True,
            approved_at=timezone.now()
        )
        
        TransactionApproval.objects.create(
            transaction=transaction,
            member=related_member,
            is_approved=False
        )
        
        serializer = self.get_serializer(transaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a transaction"""
        transaction = self.get_object()
        member = request.user.member_profile
        
        approval = TransactionApproval.objects.filter(
            transaction=transaction,
            member=member,
            is_approved=False
        ).first()
        
        if not approval:
            return Response(
                {'error': 'You cannot approve this transaction'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approval.is_approved = True
        approval.approved_at = timezone.now()
        approval.save()
        
        # Check if all approvals are done
        all_approved = TransactionApproval.objects.filter(
            transaction=transaction,
            is_approved=False
        ).count() == 0
        
        if all_approved:
            transaction.is_verified = True
            transaction.save()
        
        return Response({
            'status': 'approved',
            'verified': all_approved,
            'transaction': TransactionSerializer(transaction).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a transaction"""
        transaction = self.get_object()
        member = request.user.member_profile
        
        approval = TransactionApproval.objects.filter(
            transaction=transaction,
            member=member,
            is_approved=False
        ).first()
        
        if not approval:
            return Response(
                {'error': 'You cannot reject this transaction'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the transaction and approvals
        transaction.delete()
        return Response({'status': 'rejected'})
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending approvals for current user"""
        member = request.user.member_profile
        
        pending = Transaction.objects.filter(
            approvals__member=member,
            approvals__is_approved=False,
            is_verified=False
        ).distinct()
        
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search transactions"""
        member = request.user.member_profile
        query = request.query_params.get('q', '')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        transactions = Transaction.objects.filter(
            Q(member=member) | Q(related_member=member),
            is_verified=True
        )
        
        if query:
            transactions = transactions.filter(
                Q(related_member__name__icontains=query) |
                Q(note__icontains=query) |
                Q(event__title__icontains=query)
            )
        
        if start_date:
            transactions = transactions.filter(transaction_date__gte=start_date)
        if end_date:
            transactions = transactions.filter(transaction_date__lte=end_date)
        
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

class PayatEventViewSet(viewsets.ModelViewSet):
    serializer_class = PayatEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user.member_profile
        return PayatEvent.objects.filter(
            Q(created_by=user) | Q(members=user)
        ).distinct().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.member_profile)
    
    @action(detail=True, methods=['post'])
    def add_members(self, request, pk=None):
        event = self.get_object()
        member_ids = request.data.get('member_ids', [])
        
        for member_id in member_ids:
            member = get_object_or_404(Member, id=member_id)
            event.members.add(member)
        
        return Response({'status': 'members added'})