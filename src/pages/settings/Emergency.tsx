const Emergency = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Emergency Help</h1>
      <p>Quick access to emergency helplines.</p>
      <div className="space-y-4">
  <h2 className="text-lg font-semibold"></h2>

  <p className="text-red-600 font-medium">
    If you or someone you know is in immediate danger, call 112 now.
  </p>

  <ul className="list-disc pl-5 space-y-2">
    <li><strong>Kiran (24*7 National Mental Health Helpline):</strong> 1800-599-0019 (24/7)</li>
    <li><strong>AASRA (Suicide Prevention Helpline):</strong> +91 9820466726</li>
    <li><strong>iCALL (TATA Institute of Social Sciences):</strong> 9152987821</li>
    <li><strong>Sneha Foundation:</strong> 044-24640050</li>
  </ul>
</div>

    </div>
    
  );
};

export default Emergency;
