from django.db import models


class TransactionType(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Название типа")

    class Meta:
        verbose_name = "Тип ДДС"
        verbose_name_plural = "Типы ДДС"

    def __str__(self):
        return self.name
    

class Category(models.Model):
    name = models.CharField(max_length=150, verbose_name="Название категории")
    transaction_type = models.ForeignKey(
        TransactionType, 
        on_delete=models.CASCADE, 
        related_name="categories",
        verbose_name="Тип ДДС"
    )

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        unique_together = ('name', 'transaction_type')

    def __str__(self):
        return f"{self.name} ({self.transaction_type.name})"
    

class Subcategory(models.Model):
    name = models.CharField(max_length=150, verbose_name="Название подкатегории")
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name="subcategories",
        verbose_name="Категория"
    )

    class Meta:
        verbose_name = "Подкатегория"
        verbose_name_plural = "Подкатегории"
        unique_together = ('name', 'category')

    def __str__(self):
        return self.name
    

class Status(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Название статуса")

    class Meta:
        verbose_name = "Статус"
        verbose_name_plural = "Статусы"

    def __str__(self):
        return self.name