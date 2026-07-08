from datetime import datetime

from rest_framework import serializers

from apps.dictionaries.models import Subcategory
from .models import Transaction
from apps.dictionaries.serializers import (
    StatusSerializer, TransactionTypeSerializer, CategorySerializer, SubcategorySerializer
)
from django.utils import timezone

class TransactionSerializer(serializers.ModelSerializer):
    
    date = serializers.DateTimeField(format="%Y-%m-%d", required=False, allow_null=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        
        
    def to_internal_value(self, data):
        # Если дата пришла пустой строкой или отсутствует, мы не передаем её дальше,
        # чтобы отработал наш дефолт в validate. Если пришла — парсим.
        input_date = data.get('date')
        if input_date:
            try:
                parsed_date = datetime.strptime(input_date, "%Y-%m-%d")
                data['date'] = timezone.make_aware(parsed_date)
            except (ValueError, TypeError):
                pass
        elif 'date' in data and data['date'] == '':
            data.pop('date') # Убираем пустую строку, чтобы DRF не ругался на формат
            
        return super().to_internal_value(data)
    

    def validate(self, attrs):
        # Автоматическое заполнение даты, если пользователь оставил поле пустым
        if not attrs.get('date'):
            attrs['date'] = timezone.now()

        transaction_type = attrs.get('transaction_type')
        category = attrs.get('category')
        subcategory = attrs.get('subcategory')

        # Жесткая проверка бизнес-правил ТЗ на бэкенде:
        if category and transaction_type:
            if category.transaction_type != transaction_type:
                raise serializers.ValidationError({
                    'category': f"Категория '{category.name}' не относится к типу '{transaction_type.name}'."
                })

        if subcategory and category:
            if subcategory.category != category:
                raise serializers.ValidationError({
                    'subcategory': f"Подкатегория '{subcategory.name}' не принадлежит категории '{category.name}'."
                })

        return attrs


class TransactionListSerializer(TransactionSerializer):
    status = StatusSerializer(read_only=True)
    transaction_type = TransactionTypeSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    subcategory = SubcategorySerializer(read_only=True)