from django.shortcuts import render
from rest_framework import viewsets
from django_filters import rest_framework as filters
from .models import Transaction
from .serializers import TransactionSerializer, TransactionListSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view

class TransactionFilter(filters.FilterSet):
    start_date = filters.IsoDateTimeFilter(field_name="date", lookup_expr='date__gte')
    end_date = filters.IsoDateTimeFilter(field_name="date", lookup_expr='date__lte')

    class Meta:
        model = Transaction
        fields = ['status', 'transaction_type', 'category', 'subcategory', 'start_date', 'end_date']


@extend_schema_view(
    list=extend_schema(
        summary="Получить список транзакций (ДДС)",
        description="Возвращает историю всех движений денежных средств с полной информацией (объекты типа, категории и статуса). Доступна фильтрация.",
        responses={200: TransactionListSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Получить детали транзакции по ID",
        description="Возвращает развернутую информацию о конкретной финансовой операции.",
        responses={200: TransactionListSerializer}
    ),
    create=extend_schema(
        summary="Создать новую транзакцию",
        description="Добавляет запись о движении денежных средств. На вход ожидаются ID связанных справочников.",
        request=TransactionSerializer,
        responses={201: TransactionSerializer}
    ),
    update=extend_schema(
        summary="Полностью обновить транзакцию",
        request=TransactionSerializer,
        responses={200: TransactionSerializer}
    ),
    partial_update=extend_schema(
        summary="Частично обновить транзакцию",
        request=TransactionSerializer,
        responses={200: TransactionSerializer}
    ),
    destroy=extend_schema(
        summary="Удалить транзакцию",
        description="Безвозвратно удаляет запись о транзакции из системы."
    ),
)
@extend_schema(tags=['Учет ДДС: Транзакции'])
class TransactionViewSet(viewsets.ModelViewSet):
    """
    Основной интерфейс для мониторинга и управления движениями денежных средств (ДДС).
    """
    queryset = Transaction.objects.select_related('status', 'transaction_type', 'category', 'subcategory').all().order_by('-id')
    filterset_class = TransactionFilter

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return TransactionListSerializer
        return TransactionSerializer