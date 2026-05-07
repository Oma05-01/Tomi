from django.contrib import admin
from . models import *

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('title', 'views_count', 'created_at')
    ordering = ('-views_count',)
    search_fields = ('title', 'description')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'sent_at')
    search_fields = ('name', 'email', 'message')