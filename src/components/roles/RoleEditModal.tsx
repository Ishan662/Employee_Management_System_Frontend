import { Modal, Form, Input, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface Role {
    id: string;
    name: string;
    description?: string;
    permissions?: any[];
}

interface RoleEditModalProps {
    visible: boolean;
    role: Role| null;
    onCancel: () => void;
    form: { name: string; description: string };
    setForm: (form: { name: string; description: string }) => void;
    onSubmit: () => Promise<void>;
}

export default function RoleEditModal({
    visible,
    role,
    onCancel,
    form,
    setForm,
    onSubmit,
}: RoleEditModalProps) {
    const handleSubmit = async () => {
        if (!form.name.trim()){
            return;
        }
        await onSubmit();
    };

    return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-green-600" />
          <span>Edit Role</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form layout="vertical" onFinish={handleSubmit} className="mt-4">
        <Form.Item
          label="Role Name"
          required
          rules={[{ required: true, message: 'Please enter role name' }]}
        >
          <Input
            placeholder="Role name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Description">
          <Input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            size="large"
          />
        </Form.Item>

        <div className="flex gap-3 pt-4">
          <Button type="primary" htmlType="submit" size="large" block>
            Save Changes
          </Button>
          <Button size="large" onClick={onCancel} block>
            Cancel
          </Button>
        </div>
      </Form>
    </Modal>
  );
}