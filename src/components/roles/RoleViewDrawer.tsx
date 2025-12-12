import { Drawer, Tag, Empty } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

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

interface RoleViewDrawerProps {
  visible: boolean;
  role: Role | null;
  onClose: () => void;
}

export default function RoleViewDrawer({ visible, role, onClose }: RoleViewDrawerProps) {
  if (!role) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <EyeOutlined className="text-blue-600" />
          <span>Role Details</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      <div className="space-y-6">
        <div>
          <span className="text-sm font-medium text-gray-600 block mb-2">Role Name</span>
          <p className="text-lg font-semibold text-gray-800">{role.name}</p>
        </div>

        {role.description && (
          <div>
            <span className="text-sm font-medium text-gray-600 block mb-2">Description</span>
            <p className="text-gray-800">{role.description}</p>
          </div>
        )}

        <div>
          <span className="text-sm font-medium text-gray-600 block mb-3">Permissions</span>
          {!role.permissions || role.permissions.length === 0 ? (
            <Empty
              description="No permissions assigned"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((perm, index) => (
                <Tag key={perm.id || perm.name || index} color="green">
                  {perm.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}