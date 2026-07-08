from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

class Transaction(models.Model):
    
    date = models.DateTimeField(
        default=timezone.now, 
        verbose_name="Дата операции"
    )
    
    status = models.ForeignKey(
        'dictionaries.Status', 
        on_delete=models.PROTECT,
        related_name="transactions",
        verbose_name="Статус"
    )
    
    transaction_type = models.ForeignKey(
        'dictionaries.TransactionType', 
        on_delete=models.PROTECT, 
        related_name="transactions",
        verbose_name="Тип"
    )
    
    category = models.ForeignKey(
        'dictionaries.Category', 
        on_delete=models.PROTECT, 
        related_name="transactions",
        verbose_name="Категория"
    )
    
    subcategory = models.ForeignKey(
        'dictionaries.Subcategory', 
        on_delete=models.PROTECT, 
        related_name="transactions",
        verbose_name="Подкатегория"
    )
    
    amount = models.DecimalField(
        max_length=12,
        max_digits=12, 
        decimal_places=2, 
        verbose_name="Сумма (руб.)"
    )
    
    comment = models.TextField(
        blank=True, 
        verbose_name="Комментарий"
    )

    class Meta:
        verbose_name = "Запись ДДС"
        verbose_name_plural = "Записи ДДС"
        ordering = ['-date']

    def __str__(self):
        return f"Операция от {self.date.strftime('%d.%m.%Y')} на сумму {self.amount} руб."

    def clean(self):
        super().clean()
        
        if self.category and self.transaction_type:
            if self.category.transaction_type != self.transaction_type:
                raise ValidationError({
                    'category': f"Категория '{self.category.name}' не относится к типу '{self.transaction_type.name}'."
                })
                
        if self.subcategory and self.category:
            if self.subcategory.category != self.category:
                raise ValidationError({
                    'subcategory': f"Подкатегория '{self.subcategory.name}' не принадлежит категории '{self.category.name}'."
                })