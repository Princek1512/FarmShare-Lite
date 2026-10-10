-- Run this in MySQL Workbench against your existing `farmshare` database.
-- (users, equipment, availability already exist from earlier steps.)

USE farmshare;

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  renter_id INT NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','accepted','rejected','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (renter_id) REFERENCES users(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('simulated','razorpay') DEFAULT 'simulated',
  transaction_ref VARCHAR(100),
  status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  payment_date TIMESTAMP NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Verify:
DESCRIBE bookings;
DESCRIBE payments;
DESCRIBE reviews;

-- To make an existing registered user an Admin (register normally as
-- farmer/owner first, then run this — there's no public admin signup):
-- UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';
