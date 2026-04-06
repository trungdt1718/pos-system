-- PostgreSQL database dump for Sumi Mart POS
-- Cleaned and optimized for initialization

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

-- 2. Tables

-- Categories (dmphanloai)
CREATE TABLE IF NOT EXISTS dmphanloai (
    mapl character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    tenpl character varying(255)
);

-- Units (dmdvt)
CREATE TABLE IF NOT EXISTS dmdvt (
    madvt character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    tendvt character varying(50)
);

-- Countries (dmnuocsx)
CREATE TABLE IF NOT EXISTS dmnuocsx (
    manuocsx character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    tennuocsx character varying(255)
);

-- Suppliers (dmnhacc)
CREATE TABLE IF NOT EXISTS dmnhacc (
    mancc character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    tenncc character varying(255),
    daidien character varying(255),
    diachi character varying(255),
    dienthoai character varying(20),
    email character varying(255),
    mst character varying(255)
);

-- Products (dmhanghoa)
CREATE TABLE IF NOT EXISTS dmhanghoa (
    mahh character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    tenhh character varying(255),
    madvt character varying(20) REFERENCES dmdvt(madvt) ON UPDATE CASCADE,
    mapl character varying(20) REFERENCES dmphanloai(mapl) ON UPDATE CASCADE,
    nhasx character varying(255),
    manuocsx character varying(20) REFERENCES dmnuocsx(manuocsx) ON UPDATE CASCADE,
    mancc character varying(20) REFERENCES dmnhacc(mancc) ON UPDATE CASCADE,
    nhieudonvi numeric(1,0),
    sudung numeric(1,0),
    dinhmuc numeric(10,0),
    anuong numeric(1,0),
    giabantt numeric(20,3)
);

-- Customers (dmkh)
CREATE TABLE IF NOT EXISTS dmkh (
    makh character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    hoten character varying(255),
    gioitinh numeric(1,0),
    ngaysinh timestamp without time zone,
    namsinh character varying(4),
    diachi character varying(255),
    dienthoai character varying(20),
    email character varying(255),
    hinh bytea,
    loai numeric(1,0),
    tongtien numeric(25,2)
);

-- Staff Roles (dmloainv)
CREATE TABLE IF NOT EXISTS dmloainv (
    maloainv character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    tenloainv character varying(255)
);

-- Staff (dmnhanvien)
CREATE TABLE IF NOT EXISTS dmnhanvien (
    manv character varying(20) DEFAULT ''::character varying NOT NULL PRIMARY KEY,
    hoten character varying(255),
    gioitinh numeric(1,0),
    taikhoan character varying(20) UNIQUE,
    matkhau character varying(255),
    diachi character varying(255),
    mobile character varying(20),
    phone character varying(20),
    email character varying(50),
    tinhtrang numeric(1,0),
    maloainv character varying(20) REFERENCES dmloainv(maloainv) ON UPDATE CASCADE,
    chuky bytea
);

-- Invoices (hoadon)
CREATE TABLE IF NOT EXISTS hoadon (
    sohd character varying(20) DEFAULT ''::character varying NOT NULL,
    ngayhd timestamp without time zone,
    ngaylap timestamp without time zone,
    kyhieu character varying(50),
    makh character varying(20) REFERENCES dmkh(makh),
    thanhtienvon numeric(25,2),
    taikhoan character varying(20),
    loaixn character varying(5) DEFAULT ''::character varying NOT NULL,
    thanhtienban numeric(25,2),
    vat numeric(5,2),
    PRIMARY KEY (sohd, loaixn)
);

-- Invoice Details (pshdxn)
CREATE TABLE IF NOT EXISTS pshdxn (
    sohd character varying(20),
    mahh character varying(20) REFERENCES dmhanghoa(mahh) ON UPDATE CASCADE,
    dongia numeric(20,3),
    vat numeric(5,2),
    giavon numeric(20,3),
    giaban numeric(20,3),
    solo character varying(20),
    handung character varying(20),
    soluong numeric(14,1),
    thanhtienvon numeric(25,2),
    thanhtienban numeric(25,2),
    loaixn character varying(5),
    stt numeric(3,0),
    madvt character varying(20)
);

-- Inventory (pstonkho)
CREATE TABLE IF NOT EXISTS pstonkho (
    mahh character varying(20) REFERENCES dmhanghoa(mahh) ON UPDATE CASCADE,
    giavon numeric(20,3),
    giaban numeric(20,3),
    solo character varying(20),
    handung character varying(20),
    ton numeric(14,1),
    uutien numeric(1,0)
);

-- System Settings (hethong)
CREATE TABLE IF NOT EXISTS hethong (
    id numeric(25,3) NOT NULL PRIMARY KEY,
    tents character varying(20),
    diengiai character varying,
    giatri character varying(500),
    anh bytea
);

-- 3. Sample Data Initialization

INSERT INTO dmphanloai (mapl, tenpl) VALUES ('TP', 'Thành phẩm') ON CONFLICT DO NOTHING;
INSERT INTO dmdvt (madvt, tendvt) VALUES ('01', 'Phần') ON CONFLICT DO NOTHING;
INSERT INTO dmnuocsx (manuocsx, tennuocsx) VALUES ('VN', 'Việt Nam') ON CONFLICT DO NOTHING;
INSERT INTO dmnhacc (mancc, tenncc) VALUES ('01', 'Cung cấp 01') ON CONFLICT DO NOTHING;
INSERT INTO dmloainv (maloainv, tenloainv) VALUES ('QT', 'Quản trị hệ thống') ON CONFLICT DO NOTHING;

INSERT INTO dmhanghoa (mahh, tenhh, madvt, mapl, manuocsx, mancc, sudung, giabantt) VALUES 
('01', 'Healthy', '01', 'TP', 'VN', '01', 1, 28000.000),
('02', 'Standard', '01', 'TP', 'VN', '01', 1, 38000.000),
('03', 'Combo', '01', 'TP', 'VN', '01', 1, 28000.000)
ON CONFLICT DO NOTHING;

INSERT INTO dmkh (makh, hoten, gioitinh, ngaysinh) VALUES 
('000001', 'Bán Lẻ', 0, '2014-10-21 00:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO dmnhanvien (manv, hoten, taikhoan, matkhau, maloainv) VALUES 
('000', 'Quản trị viên', 'admin', 'd41d8cd98f00b204e9800998ecf8427e', 'QT')
ON CONFLICT DO NOTHING;

INSERT INTO hethong (id, tents, diengiai, giatri) VALUES 
(5.000, 'tendv', 'Tên đơn vị', 'Sumi Mart'),
(6.000, 'diachi', 'Địa chỉ đơn vị', '114 Mậu Thân, Ninh Kiều, Cần Thơ'),
(7.000, 'dienthoai', 'Điện thoại', '0795986289'),
(1.000, 'logo', 'Logo đơn vị', '')
ON CONFLICT DO NOTHING;
