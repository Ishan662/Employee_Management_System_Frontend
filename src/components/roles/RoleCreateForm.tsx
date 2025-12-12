import {Form, Input, Button, Card} from 'antd';

interface RoleCreateFormProps {
    visible: boolean;
    onCancel: () => void;
    form: {name: string; description: string};
    setForm: (form: {name: string; description: string}) => void;
    onSubmit: () => Promise<void>;
    loading?: boolean;
}

export default function RoleCreateForm({
    visible,
    onCancel,
    form,
    setForm,
    onSubmit,
    loading = false,
}: RoleCreateFormProps){
    if (!visible) return null;

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            return;
        }
        await onSubmit();
    }


    return (
    <Card className="mb-6 shadow-lg border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Role</h3>
      <Form layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Role Name"
            required
            className="mb-4"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input
              placeholder="e.g., Manager, Employee"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Description" className="mb-4 md:col-span-2">
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              size="large"
            />
          </Form.Item>
        </div>

        <div className="flex gap-3">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
          >
            {loading ? 'Creating...' : 'Create Role'}
          </Button>
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </Card>
    );
}