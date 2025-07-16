import { useState, useEffect } from 'react';
import { useUpdateFair } from '../Services/FairsServices';

const EditFairForm = ({ fair, onSuccess }: { fair: any, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    stand_capacity: 0,
  });

  const updateFair = useUpdateFair();

  useEffect(() => {
    if (fair) {
      setFormData({
        name: fair.name,
        description: fair.description,
        location: fair.location,
        stand_capacity: fair.stand_capacity,
      });
    }
  }, [fair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stand_capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFair.mutateAsync({ id_fair: fair.id_fair, ...formData });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border p-2" />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
      <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full border p-2" />
      <input type="number" name="stand_capacity" value={formData.stand_capacity} onChange={handleChange} className="w-full border p-2" placeholder="Stand Capacity" />
      <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Update Fair</button>
    </form>
  );
};

export default EditFairForm;
