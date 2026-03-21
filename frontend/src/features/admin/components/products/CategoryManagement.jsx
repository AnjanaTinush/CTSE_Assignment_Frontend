import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10";

function CategoryDrawer({ isOpen, onClose, title, form, setForm, onSubmit, submitLabel, actionKey, actionLoading }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white p-6 shadow-xl sm:rounded-l-[2rem]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Fruits & Vegetables"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description (optional)</label>
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description"
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!form.name.trim() || actionLoading === actionKey}
              className="w-full rounded-xl bg-[#1d4ed8] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-[#1e40af] active:scale-[0.98] disabled:opacity-50"
            >
              {actionLoading === actionKey ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const CategoryManagement = ({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  actionLoading,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const handleOpenEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, description: cat.description || "" });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    await onCategoryCreate(addForm);
    setAddForm({ name: "", description: "" });
    setAddOpen(false);
  };

  const handleUpdate = async () => {
    await onCategoryUpdate(editingId, editForm);
    setEditOpen(false);
  };

  const cellClass = "px-4 py-3 text-sm text-slate-800";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">
            All Categories
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {categories.length}
            </span>
          </h3>
          <button
            type="button"
            onClick={() => { setAddForm({ name: "", description: "" }); setAddOpen(true); }}
            className="rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
          >
            + Add Category
          </button>
        </div>

        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">#</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Category Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Description</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-14 text-center text-sm text-slate-400">
                  No categories yet. Click &quot;+ Add Category&quot; to create one.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                  <td className={cellClass + " text-slate-400"}>{index + 1}</td>
                  <td className={cellClass + " font-semibold"}>{cat.name}</td>
                  <td className={cellClass + " text-slate-500"}>{cat.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCategoryDelete(cat._id)}
                        disabled={actionLoading === `delete-category:${cat._id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Drawer */}
      <CategoryDrawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Category"
        form={addForm}
        setForm={setAddForm}
        onSubmit={handleAdd}
        submitLabel="Add Category"
        actionKey="create-category"
        actionLoading={actionLoading}
      />

      {/* Edit Drawer */}
      <CategoryDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Category"
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        actionKey={`update-category:${editingId}`}
        actionLoading={actionLoading}
      />
    </>
  );
};

export default CategoryManagement;
