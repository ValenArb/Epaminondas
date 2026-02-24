import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, wide }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-white rounded-2xl shadow-2xl p-6 ${wide ? 'max-w-3xl' : 'max-w-lg'} w-full mx-4 max-h-[85vh] overflow-y-auto`}
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
    if (!open) return null;
    return (
        <Modal open={open} onClose={onClose} title={title || '¿Estás seguro?'}>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">Cancelar</button>
                <button onClick={() => { onConfirm(); onClose(); }} className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">Confirmar</button>
            </div>
        </Modal>
    );
}

export function Notification({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-6 right-6 z-[60] bg-white border-2 border-green-300 shadow-2xl rounded-2xl px-6 py-4 max-w-md">
            <div className="flex justify-between gap-3">
                <p className="text-gray-800 font-medium whitespace-pre-line">{message}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={16} /></button>
            </div>
        </div>
    );
}
