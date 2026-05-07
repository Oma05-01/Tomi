from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.db.models import F
from django.http import JsonResponse
from .models import Photo, ContactMessage
from .forms import PhotoForm
from django.contrib.admin.views.decorators import staff_member_required

def index(request):
    photo = Photo.objects.all()
    for pic in photo:
        print(pic.full_url.url)

    return render(request, "main/index.html", {'photo': photo, 'timestamp': now().timestamp()})


def detail(request, pk):
    photo = get_object_or_404(Photo, pk=pk)
    Photo.objects.filter(pk=pk).update(views_count=F('views_count') + 1)
    return render(request, 'main/detail.html', {'photo': photo, 'timestamp': now().timestamp()})


def gallery(request):
    photo = Photo.objects.all()
    num_outfits = len(photo)
    for i, outfit in enumerate(photo):
        outfit.angle = (360 / num_outfits) * i if num_outfits > 0 else 0
    return render(request, 'main/gallery.html', {'photos': photo})


def submit_contact_form(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')

        ContactMessage.objects.create(name=name, email=email, message=message)
        return JsonResponse({'success': True})


# ==========================================
# BESPOKE ADMIN DASHBOARD (CRUD)
# ==========================================

@staff_member_required
def dashboard(request):
    """Overview of all pieces and recent client inquiries."""
    photos = Photo.objects.all().order_by('-created_at')
    messages = ContactMessage.objects.all().order_by('-sent_at')[:10]  # Get latest 10 messages
    return render(request, 'main/admin/dashboard.html', {'photos': photos, 'messages': messages})


@staff_member_required
def photo_create(request):
    """CREATE a new couture piece."""
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = PhotoForm()

    return render(request, 'main/admin/photo_form.html', {'form': form, 'action': 'Add New Piece'})


@staff_member_required
def photo_update(request, pk):
    """UPDATE an existing couture piece."""
    photo = get_object_or_404(Photo, pk=pk)
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES, instance=photo)
        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = PhotoForm(instance=photo)

    return render(request, 'main/admin/photo_form.html', {'form': form, 'action': 'Edit Piece', 'photo': photo})


@staff_member_required
def photo_delete(request, pk):
    """DELETE a couture piece."""
    photo = get_object_or_404(Photo, pk=pk)
    if request.method == 'POST':
        photo.delete()
        return redirect('dashboard')

    return render(request, 'main/admin/photo_confirm_delete.html', {'photo': photo})