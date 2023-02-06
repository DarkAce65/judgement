import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

import PageLayout from './PageLayout';

const LoadingPage = () => (
  <PageLayout>
    <div style={{ textAlign: 'center', padding: 100 }}>
      <Spin size="large" indicator={<LoadingOutlined />} />
    </div>
  </PageLayout>
);

export default LoadingPage;
