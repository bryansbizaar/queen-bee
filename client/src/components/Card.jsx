import PropTypes from "prop-types";
import formatAmount from "../utils/formatAmount";

const Card = ({ title, price, description, image }) => {
  // Handle both full URLs and image filenames
  const imageUrl = image?.includes("http")
    ? image
    : `http://localhost:8080/images/${image}`;

  return (
    <article className="card">
      {image && (
        <img 
          className="card-img" 
          src={imageUrl} 
          alt={`${title} candle product image`}
        />
      )}
      <h3 className="card-title">{title}</h3>
      <p className="card-price" aria-label={`Price: ${formatAmount(price)}`}>
        {formatAmount(price)}
      </p>
      <p className="card-text">{description}</p>
    </article>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
};

export default Card;
