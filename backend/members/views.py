from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from .models import Member, Transaction
from .serializers import MemberSerializer, TransactionSerializer
import traceback

class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Member.objects.all()

    def list(self, request, *args, **kwargs):
        try:
            queryset = Member.objects.filter(is_deleted=False)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error in list: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        try:
            if not request.data.get('name'):
                return Response(
                    {'error': 'Name is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"❌ Error creating member: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error retrieving member: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        try:
            member = self.get_object()
            transactions = member.transactions.all().order_by('-payat_date')
            serializer = TransactionSerializer(transactions, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error getting transactions: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def deleted(self, request):
        try:
            deleted_members = Member.objects.filter(is_deleted=True)
            serializer = MemberSerializer(deleted_members, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error getting deleted members: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        try:
            member = self.get_object()
            if member.is_deleted:
                return Response(
                    {'error': 'Already deleted'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            member.is_deleted = True
            member.deleted_at = timezone.now()
            member.save()
            return Response(
                {'message': 'Member moved to recently deleted', 'id': member.id}
            )
        except Exception as e:
            print(f"❌ Error soft deleting: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        try:
            member = get_object_or_404(Member, pk=pk)
            if not member.is_deleted:
                return Response(
                    {'error': 'Member is not deleted'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            member.is_deleted = False
            member.deleted_at = None
            member.save()
            return Response(
                {'message': 'Member restored', 'id': member.id}
            )
        except Exception as e:
            print(f"❌ Error restoring: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        try:
            member = get_object_or_404(Member, pk=pk)
            member.delete()
            return Response({'message': 'Permanently deleted'})
        except Exception as e:
            print(f"❌ Error permanent deleting: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return Transaction.objects.all().order_by('-payat_date')
        except Exception as e:
            print(f"❌ Error in Transaction get_queryset: {e}")
            return Transaction.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error listing transactions: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        try:
            print("📝 Creating transaction with data:", request.data)
            
            member_id = request.data.get('member')
            if not member_id:
                return Response(
                    {'error': 'Member ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                member = Member.objects.get(id=member_id)
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Member not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create transaction with all fields
            transaction = Transaction.objects.create(
                member=member,
                type=request.data.get('type', 'received'),
                amount=request.data.get('amount', 0),
                payat=request.data.get('payat', request.data.get('amount', 0)),
                payat_date=request.data.get('payat_date', timezone.now().date()),
                kittuvan=request.data.get('kittuvan', 0),
                ippol_payattiyath=request.data.get('ippol_payattiyath', 0),
                ippol_date=request.data.get('ippol_date', None),
                kodukkan=request.data.get('kodukkan', 0),
                bakki_kittan=request.data.get('bakki_kittan', 0),
                note=request.data.get('note', ''),
                is_new=True,
            )
            
            print("✅ Transaction created:", transaction.id)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"❌ Error creating transaction: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            print("📝 Updating transaction:", kwargs.get('pk'))
            print("Data:", request.data)
            
            transaction = self.get_object()
            
            # Update fields
            transaction.type = request.data.get('type', transaction.type)
            transaction.amount = request.data.get('amount', transaction.amount)
            transaction.payat = request.data.get('payat', transaction.payat)
            transaction.payat_date = request.data.get('payat_date', transaction.payat_date)
            transaction.kittuvan = request.data.get('kittuvan', transaction.kittuvan)
            transaction.ippol_payattiyath = request.data.get('ippol_payattiyath', transaction.ippol_payattiyath)
            transaction.ippol_date = request.data.get('ippol_date', transaction.ippol_date)
            transaction.kodukkan = request.data.get('kodukkan', transaction.kodukkan)
            transaction.bakki_kittan = request.data.get('bakki_kittan', transaction.bakki_kittan)
            transaction.note = request.data.get('note', transaction.note)
            transaction.save()
            
            print("✅ Transaction updated:", transaction.id)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"❌ Error updating transaction: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            transaction = self.get_object()
            transaction.delete()
            return Response({'message': 'Deleted successfully'})
        except Exception as e:
            print(f"❌ Error deleting transaction: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
