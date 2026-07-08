from django.urls import path, include
from rest_framework.routers import SimpleRouter
from apps.dictionaries.views import TransactionTypeViewSet, CategoryViewSet, SubcategoryViewSet, StatusViewSet
from apps.transactions.views import TransactionViewSet

router = SimpleRouter()

router.register(r'types', TransactionTypeViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'subcategories', SubcategoryViewSet)
router.register(r'statuses', StatusViewSet)

router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]