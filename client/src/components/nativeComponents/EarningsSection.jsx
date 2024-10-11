const EarningsSection = ({ earnings }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-headline mb-4">Earnings</h2>
      <div className="flex justify-between items-center">
        <p>Total Earnings:</p>
        <p className="font-bold text-primaryRed">
          ${earnings?.totalEarnings || 0}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <p>Upcoming Payments:</p>
        <p className="font-bold text-yellowAccent">
          ${earnings?.upcomingPayments || 0}
        </p>
      </div>
    </div>
  );
};

export default EarningsSection;
