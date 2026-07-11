import MedicineTable from '../components/medicine/MedicineTable';

const AdminMedicines = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Manage Database</h1>
      <p className="text-slate-400 mb-8">Add, edit, or remove medicines from the system.</p>
      
      <MedicineTable />
    </div>
  );
};

export default AdminMedicines;
