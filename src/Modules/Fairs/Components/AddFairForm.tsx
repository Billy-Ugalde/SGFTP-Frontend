import { useState } from 'react';
import { useAddFair } from '../Services/FairsServices';

const AddFairForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    stand_capacity: 0,
    status: true  
  });

  const [error, setError] = useState('');
  const addFair = useAddFair();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stand_capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFair.mutateAsync(formData);
      onSuccess();
    } catch (err) {
      setError('Error adding fair.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="input" />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input" />
      <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="input" />
      <input type="number" name="stand_capacity" value={formData.stand_capacity} onChange={handleChange} placeholder="Stand Capacity" className="input" />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" className="button button-primary">Add Fair</button>
    </form>
  );
};

export default AddFairForm;