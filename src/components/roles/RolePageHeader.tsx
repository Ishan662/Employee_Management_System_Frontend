import { Button } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

interface RolePageHeaderProps {
    onBack: () => void;
    onCreateClick: () => void;
    showCreateForm: boolean;
}

export default function RolePageHeader({
    onBack,
    onCreateClick,
    showCreateForm,
}: RolePageHeaderProps){
    return (
        <>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Roles Management</h1>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              size="large"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Roles</h2>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick}
            size="large"
            className="shadow-lg"
          >
            {showCreateForm ? 'Cancel' : 'Create New Role'}
          </Button>
        </div>
      </div>
        </>
    )
}