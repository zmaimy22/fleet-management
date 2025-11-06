import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useDrivers } from '../hooks/useDrivers';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const { drivers } = useDrivers();

  useEffect(() => {
    loadUsers();
    // Initialize default users if none exist
    initializeDefaultUsers();
  }, []);

  const initializeDefaultUsers = () => {
    const saved = localStorage.getItem('users');
    if (!saved) {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin'
        },
        {
          id: 2,
          username: 'conductor',
          password: '1234',
          name: 'Conductor Demo',
          role: 'driver',
          driverId: 1 // Link to first driver
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }
  };

  const loadUsers = () => {
    const saved = localStorage.getItem('users');
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch (e) {
        setUsers([]);
      }
    }
  };

  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const addUser = () => {
    const newUser = {
      id: Date.now(),
      username: '',
      password: '',
      name: '',
      role: 'driver',
      driverId: null
    };
    setEditingUser(newUser);
  };

  const saveUser = () => {
    if (!editingUser.username || !editingUser.password || !editingUser.name) {
      alert('Por favor complete todos los campos');
      return;
    }

    if (editingUser.role === 'driver' && !editingUser.driverId) {
      alert('Seleccione un conductor');
      return;
    }

    const existingIndex = users.findIndex(u => u.id === editingUser.id);
    let newUsers;

    if (existingIndex >= 0) {
      newUsers = [...users];
      newUsers[existingIndex] = editingUser;
    } else {
      newUsers = [...users, editingUser];
    }

    saveUsers(newUsers);
    setEditingUser(null);
  };

  const deleteUser = (userId) => {
    if (confirm('¿Eliminar este usuario?')) {
      const newUsers = users.filter(u => u.id !== userId);
      saveUsers(newUsers);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-600 mt-1">Administrar accesos al sistema</p>
        </div>
        <button
          onClick={addUser}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => {
              const linkedDriver = drivers.find(d => d.id === user.driverId);
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? '👔 Admin' : '🚗 Conductor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {linkedDriver ? linkedDriver.name : '--'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingUser({...user})}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {users.find(u => u.id === editingUser.id) ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="text"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value, driverId: e.target.value === 'admin' ? null : editingUser.driverId })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">👔 Administrador</option>
                  <option value="driver">🚗 Conductor</option>
                </select>
              </div>

              {editingUser.role === 'driver' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vincular a Conductor *
                  </label>
                  <select
                    value={editingUser.driverId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, driverId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar conductor...</option>
                    {drivers.filter(d => d.type === 'driver').map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2"
              >
                <X size={18} />
                <span>Cancelar</span>
              </button>
              <button
                onClick={saveUser}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Administradores:</strong> Acceso completo al sistema</li>
          <li>• <strong>Conductores:</strong> Solo pueden ver su horario y solicitar vacaciones</li>
          <li>• Los conductores deben estar vinculados a un registro en la lista de conductores</li>
        </ul>
      </div>
    </div>
  );
}
