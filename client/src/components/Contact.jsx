import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: "", // 'success', 'error', or ''
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear status when user starts typing
    if (status.type) {
      setStatus({ type: "", message: "" });
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push("Name is required");
    }

    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!formData.subject.trim()) {
      errors.push("Subject is required");
    }

    if (!formData.message.trim()) {
      errors.push("Message is required");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setStatus({
        type: "error",
        message: errors.join(". "),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message:
            "Thank you for your message! We'll get back to you within 24 hours.",
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: result.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <div className="contact-header">
          <h1>Contact Queen Bee Candles</h1>
          <p className="contact-subtitle">
            Have a question about our handcrafted candles? We&apos;d love to
            hear from you!
          </p>
        </div>

        <div className="contact-main">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <div className="contact-details">
              <div className="contact-item">
                <h3>📧 Email</h3>
                <p>queenbcandlesnz@gmail.com</p>
              </div>

              <div className="contact-item">
                <h3>🕒 Response Time</h3>
                <p>We typically respond within 24 hours</p>
              </div>

              <div className="contact-item">
                <h3>🌟 What we can help with</h3>
                <ul>
                  <li>Custom candle orders</li>
                  <li>Product questions</li>
                  <li>Shipping and returns</li>
                  <li>Care instructions</li>
                </ul>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send us a message</h2>

            {status.message && (
              <div className={`form-status ${status.type}`}>
                {status.message}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="What's this about?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows="6"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
