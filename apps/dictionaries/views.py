from django.shortcuts import render
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import TransactionType, Category, Subcategory, Status
from .serializers import (
    TransactionTypeSerializer, CategorySerializer, SubcategorySerializer, StatusSerializer
)
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(summary="Получить список типов операций", description="Возвращает доступные типы (например: Пополнение, Списание)."),
    retrieve=extend_schema(summary="Получить тип операции по ID"),
    create=extend_schema(summary="Создать новый тип операции"),
    update=extend_schema(summary="Обновить тип операции"),
    partial_update=extend_schema(summary="Частично обновить тип операции"),
    destroy=extend_schema(summary="Удалить тип операции"),
)
@extend_schema(tags=['Справочники: Типы операций'])
class TransactionTypeViewSet(viewsets.ModelViewSet):
    """
    Интерфейс для управления базовыми типами финансовых операций.
    """
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer


@extend_schema_view(
    list=extend_schema(summary="Получить список категорий", description="Возвращает список категорий. Доступна фильтрация по типу операции через `?transaction_type=ID`."),
    retrieve=extend_schema(summary="Получить категорию по ID"),
    create=extend_schema(summary="Создать новую категорию"),
    update=extend_schema(summary="Обновить категорию"),
    partial_update=extend_schema(summary="Частично обновить категорию"),
    destroy=extend_schema(summary="Удалить категорию"),
)
@extend_schema(tags=['Справочники: Категории'])
class CategoryViewSet(viewsets.ModelViewSet):
    """
    API для управления категориями транзакций.
    Позволяет фильтровать категории по типу операции (?transaction_type=1)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['transaction_type'] # Позволит делать /api/categories/?transaction_type=1


@extend_schema_view(
    list=extend_schema(summary="Получить список подкатегорий", description="Возвращает список подкатегорий. Доступна фильтрация по родительской категории через `?category=ID`."),
    retrieve=extend_schema(summary="Получить подкатегорию по ID"),
    create=extend_schema(summary="Создать новую подкатегорию"),
    update=extend_schema(summary="Обновить подкатегорию"),
    partial_update=extend_schema(summary="Частично обновить подкатегорию"),
    destroy=extend_schema(summary="Удалить подкатегорию"),
)
@extend_schema(tags=['Справочники: Подкатегории'])
class SubcategoryViewSet(viewsets.ModelViewSet):
    """
    Интерфейс для управления подкатегориями второго уровня (например: Супермаркеты внутри категории Продукты).
    """
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category'] # Позволит делать /api/subcategories/?category=2


@extend_schema_view(
    list=extend_schema(summary="Получить список статусов", description="Возвращает все возможные статусы транзакций (например: Проведено, В обработке, Отклонено)."),
    retrieve=extend_schema(summary="Получить статус по ID"),
    create=extend_schema(summary="Создать новый статус"),
    update=extend_schema(summary="Обновить статус"),
    partial_update=extend_schema(summary="Частично обновить статус"),
    destroy=extend_schema(summary="Удалить статус"),
)
@extend_schema(tags=['Справочники: Статусы'])
class StatusViewSet(viewsets.ModelViewSet):
    """
    Интерфейс для управления жизненными циклами и статусами транзакций.
    """
    queryset = Status.objects.all()
    serializer_class = StatusSerializer