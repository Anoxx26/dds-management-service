from django.shortcuts import render
from rest_framework import viewsets
from django_filters import rest_framework as filters
from .models import Transaction
from .serializers import TransactionSerializer, TransactionListSerializer

class TransactionFilter(filters.FilterSet):
    start_date = filters.IsoDateTimeFilter(field_name="date", lookup_expr='date__gte')
    end_date = filters.IsoDateTimeFilter(field_name="date", lookup_expr='date__lte')

    class Meta:
        model = Transaction
        fields = ['status', 'transaction_type', 'category', 'subcategory', 'start_date', 'end_date']

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('status', 'transaction_type', 'category', 'subcategory').all()
    filterset_class = TransactionFilter

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return TransactionListSerializer
        return TransactionSerializer