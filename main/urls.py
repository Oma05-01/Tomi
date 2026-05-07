from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('detail/<int:pk>', views.detail, name='detail'),
    path('gallery/', views.gallery, name='gallery'),
    path('submit-contact/', views.submit_contact_form, name='submit_contact_form'),

    path('', views.index, name='home'),
    path('detail/<int:pk>/', views.detail, name='detail'),
    path('gallery/', views.gallery, name='gallery'),
    path('submit-contact/', views.submit_contact_form, name='submit_contact_form'),

    # New Admin Dashboard URLs
    path('atelier-admin/', views.dashboard, name='dashboard'),
    path('atelier-admin/add/', views.photo_create, name='photo_create'),
    path('atelier-admin/<int:pk>/edit/', views.photo_update, name='photo_update'),
    path('atelier-admin/<int:pk>/delete/', views.photo_delete, name='photo_delete'),

]
