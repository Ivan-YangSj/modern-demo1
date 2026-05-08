import React from 'react';

interface IProps {}

const page: React.FC<IProps> = (props) => {
  const {} = props;
  
  return <div>about</div>;
};

export default React.memo(page);