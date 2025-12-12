import { Table, Button, Space, Card, Popconfirm, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

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

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onEditPermissions: (role: Role) => void;
  onDelete: (role: Role) => Promise<void>;
}

export default function RolesTable({
  roles,
  loading,
  onView,
  onEdit,
  onEditPermissions,
  onDelete,
}: RolesTableProps) {
  const columns: ColumnsType<Role> = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span className="text-gray-400 italic">No description</span>,
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => (
        <Tag color="blue">{record.permissions?.length || 0} permissions</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            size="small"
          >
            View
          </Button>
          <Button
            type="default"
            icon={<LockOutlined />}
            onClick={() => onEditPermissions(record)}
            size="small"
            className="text-purple-600 border-purple-300 hover:text-purple-700 hover:border-purple-400"
          >
            Permissions
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Role"
            description={`Are you sure you want to delete the role "${record.name}"?`}
            onConfirm={() => onDelete(record)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={roles}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} roles`,
        }}
      />
    </Card>
  );
}