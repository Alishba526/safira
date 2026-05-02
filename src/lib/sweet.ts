import Swal from 'sweetalert2';

// Luxury beige/gold themed SweetAlert toast — always centered popup
const baseStyle = {
  background: '#1a1710',
  color: '#e8dfd0',
  confirmButtonColor: '#c8a96e',
  iconColor: '#c8a96e',
  customClass: {
    popup: 'safira-swal-popup',
    title: 'safira-swal-title',
    htmlContainer: 'safira-swal-text',
    confirmButton: 'safira-swal-btn',
  },
};

export const sweetSuccess = (title: string, text?: string) =>
  Swal.fire({
    ...baseStyle,
    icon: 'success',
    title,
    text,
    timer: 1600,
    showConfirmButton: false,
    position: 'center',
    backdrop: 'rgba(26, 23, 16, 0.55)',
  });

export const sweetError = (title: string, text?: string) =>
  Swal.fire({
    ...baseStyle,
    icon: 'error',
    title,
    text,
    position: 'center',
  });

export const sweetInfo = (title: string, text?: string) =>
  Swal.fire({
    ...baseStyle,
    icon: 'info',
    title,
    text,
    timer: 1600,
    showConfirmButton: false,
    position: 'center',
  });

export const sweetConfirm = (title: string, text?: string) =>
  Swal.fire({
    ...baseStyle,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    cancelButtonColor: '#3a342a',
    confirmButtonText: 'Yes',
    position: 'center',
  });
