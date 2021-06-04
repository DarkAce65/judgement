import { Button, Result } from 'antd';
import { useHistory } from 'react-router';

const ErrorPage = () => {
  const history = useHistory();

  return (
    <Result
      status="error"
      title="Error"
      subTitle="An error occurred, please refresh the page or try again later."
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          Go Home
        </Button>
      }
    />
  );
};

export default ErrorPage;
