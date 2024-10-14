import { useState, ChangeEvent } from 'react';

const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;{
      if (name === 'email') setEmail(value);
      if (name === 'password') setPassword(value);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  return { email, password, handleChange, resetForm };
};

export default useLoginForm;
