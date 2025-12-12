import { Modal, Checkbox, Empty, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

interface RolePermissionsModalProps {
  visible: boolean;
  role: Role | null;
  allPermissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (id: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export default function RolePermissionsModal({
  visible,
  role,
  allPermissions,
  selectedPermissions,
  onTogglePermission,
  onSubmit,
  onCancel,
}: RolePermissionsModalProps) {
  if (!role) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockOutlined className="text-purple-600" />
          <span>Manage Permissions - {role.name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" size="large" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" size="large" onClick={onSubmit}>
          Save Permissions ({selectedPermissions.length})
        </Button>,
      ]}
    >
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-4">
          Select the permissions to assign to this role. Users with this role will have access to
          all selected permissions.
        </p>

        {allPermissions.length === 0 ? (
          <Empty description="No permissions available" />
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allPermissions.map((permission, index) => {
              const permId = permission.id || permission.name;
              return (
                <div
                  key={permId || index}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedPermissions.includes(permId)}
                    onChange={() => onTogglePermission(permId)}
                  >
                    <div className="ml-2">
                      <p className="font-medium text-gray-800">{permission.name}</p>
                      {permission.description && (
                        <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                      )}
                    </div>
                  </Checkbox>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}