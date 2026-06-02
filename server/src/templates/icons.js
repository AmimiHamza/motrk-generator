// Gold line-style SVG icons for the specs panel.
// Each takes currentColor so the gold is set via CSS `color`.

const wrap = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">${inner}</svg>`;

export const icons = {
  // الموديل — calendar
  model: wrap(
    `<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v3M16 3v3"/><path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/>`
  ),
  // الماركة — car front
  brand: wrap(
    `<path d="M5 11l1.4-4.2A2 2 0 0 1 8.3 5.4h7.4a2 2 0 0 1 1.9 1.4L19 11"/><path d="M4 11h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V18H9v1.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V18H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z"/><path d="M7 14.5h1.5M15.5 14.5H17"/>`
  ),
  // الفئة — car body / side
  category: wrap(
    `<path d="M2.5 13.5l1.8-4.6A3 3 0 0 1 7.1 7h6.5a3 3 0 0 1 2.3 1.1l2.4 2.9 2.1.6a1.5 1.5 0 0 1 1.1 1.4v1.5a1 1 0 0 1-1 1h-1.3"/><path d="M2.5 13.5V15a1 1 0 0 0 1 1h1.2"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/><path d="M9 16h6"/>`
  ),
  // المحرك — engine block
  engine: wrap(
    `<path d="M5 9h2V7h4v2h3l2 2h2v3h1.5v3H18l-1.5 2H9l-2-2H5a1 1 0 0 1-1-1v-1H2.5v-3H4V10a1 1 0 0 1 1-1z"/><path d="M11 9h0"/>`
  ),
  // ناقل الحركة — gear shifter
  transmission: wrap(
    `<circle cx="12" cy="5" r="2"/><path d="M12 7v11"/><path d="M12 12H6a0 0 0 0 0 0 0v6M12 12h6v6"/><path d="M6 18h0M18 18h0M12 18h0"/>`
  ),
  // نوع الوقود — fuel pump
  fuel: wrap(
    `<path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16"/><path d="M3 21h13"/><path d="M6 9h7"/><path d="M14 8l3 3v6.5a1.5 1.5 0 0 0 3 0V11l-2.5-2.5"/>`
  ),
  // اللون — paint palette
  color: wrap(
    `<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.9 1.7-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.6 1.7-1.6H16a5 5 0 0 0 5-5c0-3.9-3.6-7-9-7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15" cy="8.5" r="1"/>`
  ),
  // phone
  phone: wrap(
    `<path d="M6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2L20 15v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4z"/>`
  ),
  location: wrap(
    `<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>`
  ),
  whatsapp: wrap(
    `<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M8.5 8.5c-.3 1 .2 2.4 1.4 3.6s2.6 1.7 3.6 1.4l1-1-1.6-1.2-1 .6c-.5-.2-1-.5-1.5-1s-.8-1-1-1.5l.6-1L9.5 7.5z"/>`
  ),
  instagram: wrap(
    `<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r="1"/>`
  ),
};
