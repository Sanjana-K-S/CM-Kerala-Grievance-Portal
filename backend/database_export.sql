-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2026 at 01:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cm_kerala_grievance`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` int(11) NOT NULL,
  `grievance_id` int(11) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `grievance_id`, `file_name`, `file_path`, `uploaded_at`) VALUES
(1, 2, '1a.png', 'uploads/5838b98a83104790bf2ee499f7726c28.png', '2026-11-17 16:36:27');

-- --------------------------------------------------------

--
-- Table structure for table `citizen_feedback`
--

CREATE TABLE `citizen_feedback` (
  `id` int(11) NOT NULL,
  `grievance_id` int(11) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `citizen_feedback`
--

INSERT INTO `citizen_feedback` (`id`, `grievance_id`, `citizen_id`, `rating`, `comments`, `created_at`) VALUES
(1, 1, 2, 3, NULL, '2026-11-17 16:43:37');

-- --------------------------------------------------------

--
-- Table structure for table `contact_email_otps`
--

CREATE TABLE `contact_email_otps` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `name` varchar(150) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_enquiries`
--

CREATE TABLE `contact_enquiries` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(30) NOT NULL DEFAULT 'Pending',
  `admin_response` text DEFAULT NULL,
  `responded_at` datetime DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_enquiries`
--

INSERT INTO `contact_enquiries` (`id`, `name`, `email`, `subject`, `message`, `created_at`, `status`, `admin_response`, `responded_at`, `email_verified`) VALUES
(1, 'Test Citizen', 'test@example.com', 'Road maintenance enquiry', 'I would like to know the status of road maintenance in my area.', '2026-11-18 10:08:05', 'Responded', 'solved', '2026-11-18 10:35:27', 0),
(2, 'Ann', 'ann@gmail.com', 'Road maintenance enquiry', 'Road maintenance enquiry', '2026-11-18 10:36:50', 'Responded', 'done', '2026-11-18 10:37:21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Public Works Department', 'Roads, bridges and infrastructure', '2026-11-17 14:26:54'),
(2, 'Health Department', 'Public healthcare and medical services', '2026-11-17 14:26:54'),
(3, 'Education Department', 'Schools and educational facilities', '2026-11-17 14:26:54'),
(4, 'Local Self Government', 'Municipal and local administration', '2026-11-17 14:26:54'),
(5, 'Water Resources Department', 'Water supply and irrigation', '2026-11-17 14:26:54'),
(6, 'Transport Department', 'Public transportation and road safety', '2026-11-17 14:26:54'),
(7, 'Electricity Department', 'Electricity supply and maintenance', '2026-11-17 14:26:54');

-- --------------------------------------------------------

--
-- Table structure for table `department_assignments`
--

CREATE TABLE `department_assignments` (
  `id` int(11) NOT NULL,
  `grievance_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `officer_id` int(11) DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department_assignments`
--

INSERT INTO `department_assignments` (`id`, `grievance_id`, `department_id`, `officer_id`, `assigned_by`, `assigned_at`) VALUES
(1, 1, 1, 4, 3, '2026-11-17 15:41:09');

-- --------------------------------------------------------

--
-- Table structure for table `grievances`
--

CREATE TABLE `grievances` (
  `id` int(11) NOT NULL,
  `reference_number` varchar(30) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `district` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `status` enum('Submitted','Under Review','In Progress','Resolved','Reopened') DEFAULT 'Submitted',
  `ai_department_suggestion` varchar(150) DEFAULT NULL,
  `ai_summary` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grievances`
--

INSERT INTO `grievances` (`id`, `reference_number`, `citizen_id`, `district`, `category`, `subject`, `description`, `priority`, `status`, `ai_department_suggestion`, `ai_summary`, `created_at`, `updated_at`) VALUES
(1, 'CMK-20261117-167E30EC', 2, 'Ernakulam', 'Road Maintenance', 'Damaged road near residential area', 'The road near our residential area has several potholes causing difficulty for commuters.', 'High', 'Resolved', NULL, NULL, '2026-11-17 15:08:34', '2026-11-17 16:42:56'),
(2, 'CMK-20261117-89E6952A', 2, 'ekm', 'health', 'string', 'stringstri', 'Medium', 'Submitted', NULL, NULL, '2026-11-17 15:14:19', '2026-11-17 15:14:19');

-- --------------------------------------------------------

--
-- Table structure for table `grievance_history`
--

CREATE TABLE `grievance_history` (
  `id` int(11) NOT NULL,
  `grievance_id` int(11) NOT NULL,
  `changed_by` int(11) NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grievance_history`
--

INSERT INTO `grievance_history` (`id`, `grievance_id`, `changed_by`, `old_status`, `new_status`, `remarks`, `created_at`) VALUES
(1, 1, 4, 'Submitted', 'Under Review', 'review work is doing', '2026-11-17 16:22:56'),
(2, 1, 4, 'Under Review', 'Resolved', 'completed', '2026-11-17 16:42:56');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('citizen','cmo_admin','officer') NOT NULL DEFAULT 'citizen',
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password_hash`, `role`, `department_id`, `created_at`) VALUES
(1, 'Test Citizen', 'citizen@example.com', '9876543210', '$2b$12$jgZjz5/9p5Ma5reu7RAQC.uLEdoL8ABIj1YR9oeehQhehqX1aDHna', 'citizen', NULL, '2026-11-17 14:43:13'),
(2, 'Ann', 'ann@gmail.com', '0022113344', '$2b$12$06foquVUP92Xlw2V05zkz.nZjWtNLWxzjnSpxp4xQqbNPmc48XO8C', 'citizen', NULL, '2026-11-17 14:47:28'),
(3, 'cm', 'cm@gmail.com', '0011223344', '$2b$12$rkNETb.ult02lR/gRpBSD.cwK3bK7aneg6aaWSOI0EnXo2hsb30W2', 'cmo_admin', NULL, '2026-11-17 15:32:57'),
(4, 'officer', 'officer@gmail.com', '88779944', '$2b$12$X4Gbh5MulNTUg750mWiAOeBHBR9Q591upk0tZlmPObUSTCygWV5be', 'officer', 1, '2026-11-17 15:33:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grievance_id` (`grievance_id`);

--
-- Indexes for table `citizen_feedback`
--
ALTER TABLE `citizen_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grievance_id` (`grievance_id`),
  ADD KEY `citizen_id` (`citizen_id`);

--
-- Indexes for table `contact_email_otps`
--
ALTER TABLE `contact_email_otps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_enquiries`
--
ALTER TABLE `contact_enquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `department_assignments`
--
ALTER TABLE `department_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grievance_id` (`grievance_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `officer_id` (`officer_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `grievances`
--
ALTER TABLE `grievances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD UNIQUE KEY `uq_grievances_reference_number` (`reference_number`),
  ADD KEY `citizen_id` (`citizen_id`);

--
-- Indexes for table `grievance_history`
--
ALTER TABLE `grievance_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grievance_id` (`grievance_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `citizen_feedback`
--
ALTER TABLE `citizen_feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_email_otps`
--
ALTER TABLE `contact_email_otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_enquiries`
--
ALTER TABLE `contact_enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `department_assignments`
--
ALTER TABLE `department_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `grievances`
--
ALTER TABLE `grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grievance_history`
--
ALTER TABLE `grievance_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`grievance_id`) REFERENCES `grievances` (`id`);

--
-- Constraints for table `citizen_feedback`
--
ALTER TABLE `citizen_feedback`
  ADD CONSTRAINT `citizen_feedback_ibfk_1` FOREIGN KEY (`grievance_id`) REFERENCES `grievances` (`id`),
  ADD CONSTRAINT `citizen_feedback_ibfk_2` FOREIGN KEY (`citizen_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `department_assignments`
--
ALTER TABLE `department_assignments`
  ADD CONSTRAINT `department_assignments_ibfk_1` FOREIGN KEY (`grievance_id`) REFERENCES `grievances` (`id`),
  ADD CONSTRAINT `department_assignments_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `department_assignments_ibfk_3` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `department_assignments_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `grievances`
--
ALTER TABLE `grievances`
  ADD CONSTRAINT `grievances_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `grievance_history`
--
ALTER TABLE `grievance_history`
  ADD CONSTRAINT `grievance_history_ibfk_1` FOREIGN KEY (`grievance_id`) REFERENCES `grievances` (`id`),
  ADD CONSTRAINT `grievance_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
