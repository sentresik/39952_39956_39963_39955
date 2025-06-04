from django.urls import path, include
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', views.home, name='home'),
    path('index/', views.home, name='home_index'),
    path('start/', views.start_view, name='start'),
    path('register/', views.register_view, name='register'),
    path('edit/', views.edit_requests_view, name='edit_requests'),
    path('logout/', LogoutView.as_view(next_page='/start/'), name='logout'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/custom_login/', views.custom_login, name='custom_login'),
]