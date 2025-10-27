import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import formatAmount from "../utils/formatAmount";

const CardWithLink = ({ id, title, price, description, image }) => {
  // Handle both full URLs and image filenames
  const imageUrl = image?.includes("http")
    ? image
    : `http://localhost:8080/images/${image}`;

  return (
    <div className="card">
      <Link to={`/product/${id}`} className="card-link">
        {image && <img className="card-img" src={imageUrl} alt={title} />}
        <h2 className="card-title">{title}</h2>
        <h3 className="card-price">{formatAmount(price)}</h3>
        <p className="card-text">{description}</p>
      </Link>
    </div>
  );
};

CardWithLink.propTypes = {
  // Accept either string or number for id
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
};

export default CardWithLink;
