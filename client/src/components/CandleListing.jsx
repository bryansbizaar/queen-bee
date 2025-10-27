import candles from "../candles.json";

const CandleListing = () => {
  return (
    <>
      <div>
        {candles.map((candle) => (
          <div key={candle.id}>
            {
              <img
                src={`http://localhost:8080/images/${candle.image}`}
                alt={candle.title}
              />
            }
          </div>
        ))}
      </div>
    </>
  );
};

export default CandleListing;
