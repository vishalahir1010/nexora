import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService.js";
import { getErrorMessage } from "../../services/api.js";
import Loader from "../../components/common/Loader.jsx";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminService.getUsers({ search: search || undefined }).then((res) => {
      setUsers(res.data.data.users);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateUserRole(id, role);
      toast.success("Role updated");
      setUsers((u) => u.map((x) => (x._id === id ? { ...x, role } : x)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await adminService.toggleUserActive(id);
      setUsers((u) => u.map((x) => (x._id === id ? res.data.data.user : x)));
      toast.success("User status updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="section-title mb-6">Users</h1>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field sm:max-w-xs" />
      </form>

      {loading ? <Loader /> : (
        <>
          <div className="card overflow-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-gray-100">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4 text-muted">{u.email}</td>
                    <td className="p-4">
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="input-field !py-1.5 !px-2 text-xs">
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleToggleActive(u._id)} className="text-xs text-muted hover:text-ink underline">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <div key={u._id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="input-field !py-2 text-sm flex-1"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleToggleActive(u._id)}
                    className="btn-secondary !py-2 !px-3 text-xs shrink-0"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <p className="text-sm text-muted text-center py-10">No users found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;