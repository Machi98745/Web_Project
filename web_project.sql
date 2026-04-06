-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 03, 2026 at 08:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `web_project`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `username`, `password`) VALUES
(101, 'admin', '$argon2id$v=19$m=19456,t=2,p=1$zNRwjUPsP+GkhtpPczrAPg$/GUCJizxKLtPX+Fqzde9lGZ8c1btOaqtxJHnlCaC8zg');

-- --------------------------------------------------------

--
-- Table structure for table `cooks`
--

CREATE TABLE `cooks` (
  `cook_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` enum('enable','disable') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cooks`
--

INSERT INTO `cooks` (`cook_id`, `username`, `password`, `status`) VALUES
(201, 'C001', '$argon2id$v=19$m=19456,t=2,p=1$JVRyC9txPdUj4c0rEGAqGg$p3ckdOCsW3SyP9I2mGQKiv0ILTwcYzjwiZUAYfipZas', 'enable'),
(202, 'C002', '$argon2id$v=19$m=19456,t=2,p=1$F8NRVgQaM28CMEZfkrMd6A$DA/S6HLjexCufFo31RFM3rVVDybE28cqz7gUB/X1DJQ', 'enable'),
(203, 'C003', '$argon2id$v=19$m=19456,t=2,p=1$D6tPLwbPh3KQYC+d0uA3kg$hTWzdxUEYZ42zUx7UakYc0xezJY4SSJG41aBGcNIFZE', 'enable'),
(204, 'C004', '$argon2id$v=19$m=19456,t=2,p=1$SYaGL/MJryOTe5RT3vDR3g$4po91eF5Sh/3NNxCInjyzHoqvXLvpyWrslyc8tqn6gw', 'enable');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) UNSIGNED NOT NULL,
  `table_number` int(11) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `status` enum('active','paid') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `table_number`, `created_at`, `status`) VALUES
(101, 1, '2026-04-03 13:03:20', 'paid'),
(102, 2, '2026-03-31 23:02:25', 'paid'),
(103, 3, '2026-04-03 12:43:59', 'paid'),
(104, 4, '2026-03-31 17:09:22', 'paid'),
(105, 5, '2026-03-31 21:53:53', 'paid'),
(106, 6, '2026-03-31 21:49:37', 'paid'),
(107, 7, '2026-03-31 16:51:15', 'paid'),
(108, 8, '2026-03-31 22:17:45', 'paid');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `menu_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(10) UNSIGNED NOT NULL,
  `status` enum('enable','disable') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`menu_id`, `name`, `price`, `status`) VALUES
(1001, 'Pad Thai', 80, 'enable'),
(1002, 'Cheeseburger', 120, 'enable'),
(1003, 'Greek Salad', 90, 'enable'),
(1004, 'Caesar Salad', 95, 'enable'),
(1005, 'Margherita Pizza', 180, 'enable'),
(1006, 'Spaghetti Carbonara', 150, 'enable'),
(1007, 'Sushi Platter', 250, 'enable'),
(1008, 'Chicken Curry', 110, 'enable'),
(1009, 'Tom Yum Goong', 130, 'enable'),
(1010, 'Massaman Curry', 130, 'enable'),
(1011, 'Papaya Salad', 70, 'enable'),
(1012, 'Fried Rice', 60, 'enable'),
(1013, 'Pepperoni Pizza', 200, 'enable'),
(1014, 'Garlic Bread', 50, 'enable'),
(1015, 'Steamed Rice', 20, 'enable'),
(1016, 'Shredded Chicken Noodles', 50, 'enable'),
(2001, 'Iced Tea', 40, 'enable'),
(2002, 'Lemonade', 45, 'enable'),
(2003, 'Thai Iced Tea', 50, 'enable'),
(2004, 'Green Tea', 40, 'enable'),
(2005, 'Soda', 25, 'enable'),
(2006, 'Lemon soda', 40, 'enable');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `order_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`order_id`, `customer_id`, `created_at`) VALUES
(46, 102, '2026-03-31 23:02:36'),
(47, 103, '2026-04-03 12:44:05'),
(48, 101, '2026-04-03 13:03:24');

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `order_item_id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `menu_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','cooking','serving') NOT NULL,
  `updated_by` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`order_item_id`, `order_id`, `menu_id`, `quantity`, `status`, `updated_by`) VALUES
(60, 47, 1001, 1, 'serving', 201),
(61, 47, 1002, 1, 'serving', 201),
(62, 47, 1004, 1, 'serving', 201),
(63, 48, 1001, 1, 'serving', 201),
(64, 48, 1002, 1, 'serving', 201);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `total_price` decimal(10,0) UNSIGNED NOT NULL,
  `paid_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `customer_id`, `total_price`, `paid_at`) VALUES
(9, 102, 240, '2026-03-30 23:08:03'),
(10, 102, 160, '2026-03-30 23:10:06'),
(11, 102, 180, '2026-03-30 23:12:25'),
(12, 102, 160, '2026-03-30 23:15:49'),
(13, 103, 1030, '2026-03-31 00:33:19'),
(14, 102, 110, '2026-03-31 00:34:57'),
(15, 107, 610, '2026-03-31 00:36:45'),
(16, 102, 80, '2026-03-31 00:46:19'),
(17, 104, 480, '2026-03-31 17:12:14'),
(18, 103, 295, '2026-04-03 12:44:30'),
(19, 101, 200, '2026-04-03 13:03:50');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `review_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(11) UNSIGNED NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL,
  `rating` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`review_id`, `customer_id`, `comment`, `created_at`, `rating`) VALUES
(13, 103, 'good', '2026-04-03 12:44:40', 5),
(14, 101, '///', '2026-04-03 13:04:02', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `cooks`
--
ALTER TABLE `cooks`
  ADD PRIMARY KEY (`cook_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`menu_id`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`,`menu_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `cooks`
--
ALTER TABLE `cooks`
  MODIFY `cook_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=205;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `menu_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2007;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `order_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `order_item`
--
ALTER TABLE `order_item`
  MODIFY `order_item_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `review_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`),
  ADD CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`menu_id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
