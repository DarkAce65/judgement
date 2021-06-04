import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const LoadingPage = () => (
  <div style={{ textAlign: 'center', padding: 100 }}>
    <Spin size="large" indicator={<LoadingOutlined />} />
  </div>
);

export default LoadingPage;
