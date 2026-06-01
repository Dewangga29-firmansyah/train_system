-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PELANGGAN');

-- CreateEnum
CREATE TYPE "Kelas" AS ENUM ('EKSEKUTIF', 'EKONOMI');

-- CreateEnum
CREATE TYPE "StatusPembelian" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelanggan" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Petugas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Petugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kereta" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kereta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gerbong" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL,
    "kelas" "Kelas" NOT NULL,
    "keretaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gerbong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kursi" (
    "id" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "seat" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "gerbongId" TEXT NOT NULL,

    CONSTRAINT "Kursi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" TEXT NOT NULL,
    "asal" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "tanggalBerangkat" TIMESTAMP(3) NOT NULL,
    "tanggalTiba" TIMESTAMP(3) NOT NULL,
    "harga" DECIMAL(10,2) NOT NULL,
    "keretaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembelian" (
    "id" TEXT NOT NULL,
    "kodeBooking" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusPembelian" NOT NULL DEFAULT 'PENDING',
    "pelangganId" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembelian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPembelian" (
    "id" TEXT NOT NULL,
    "namaPenumpang" TEXT NOT NULL,
    "pembelianId" TEXT NOT NULL,
    "kursiId" TEXT NOT NULL,
    "gerbongId" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,

    CONSTRAINT "DetailPembelian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "metode" TEXT NOT NULL DEFAULT 'QRIS',
    "qrImageUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "pembelianId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_nik_key" ON "Pelanggan"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_userId_key" ON "Pelanggan"("userId");

-- CreateIndex
CREATE INDEX "Pelanggan_userId_idx" ON "Pelanggan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Petugas_userId_key" ON "Petugas"("userId");

-- CreateIndex
CREATE INDEX "Petugas_userId_idx" ON "Petugas"("userId");

-- CreateIndex
CREATE INDEX "Kereta_nama_idx" ON "Kereta"("nama");

-- CreateIndex
CREATE INDEX "Gerbong_keretaId_idx" ON "Gerbong"("keretaId");

-- CreateIndex
CREATE INDEX "Kursi_gerbongId_idx" ON "Kursi"("gerbongId");

-- CreateIndex
CREATE UNIQUE INDEX "Kursi_gerbongId_row_seat_key" ON "Kursi"("gerbongId", "row", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "Kursi_gerbongId_label_key" ON "Kursi"("gerbongId", "label");

-- CreateIndex
CREATE INDEX "Jadwal_keretaId_idx" ON "Jadwal"("keretaId");

-- CreateIndex
CREATE INDEX "Jadwal_asal_idx" ON "Jadwal"("asal");

-- CreateIndex
CREATE INDEX "Jadwal_tujuan_idx" ON "Jadwal"("tujuan");

-- CreateIndex
CREATE INDEX "Jadwal_tanggalBerangkat_idx" ON "Jadwal"("tanggalBerangkat");

-- CreateIndex
CREATE UNIQUE INDEX "Pembelian_kodeBooking_key" ON "Pembelian"("kodeBooking");

-- CreateIndex
CREATE INDEX "Pembelian_pelangganId_idx" ON "Pembelian"("pelangganId");

-- CreateIndex
CREATE INDEX "Pembelian_jadwalId_idx" ON "Pembelian"("jadwalId");

-- CreateIndex
CREATE INDEX "Pembelian_status_idx" ON "Pembelian"("status");

-- CreateIndex
CREATE INDEX "DetailPembelian_pembelianId_idx" ON "DetailPembelian"("pembelianId");

-- CreateIndex
CREATE INDEX "DetailPembelian_jadwalId_idx" ON "DetailPembelian"("jadwalId");

-- CreateIndex
CREATE INDEX "DetailPembelian_gerbongId_idx" ON "DetailPembelian"("gerbongId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailPembelian_kursiId_jadwalId_key" ON "DetailPembelian"("kursiId", "jadwalId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pembelianId_key" ON "Payment"("pembelianId");

-- CreateIndex
CREATE INDEX "Payment_pembelianId_idx" ON "Payment"("pembelianId");

-- AddForeignKey
ALTER TABLE "Pelanggan" ADD CONSTRAINT "Pelanggan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petugas" ADD CONSTRAINT "Petugas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gerbong" ADD CONSTRAINT "Gerbong_keretaId_fkey" FOREIGN KEY ("keretaId") REFERENCES "Kereta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kursi" ADD CONSTRAINT "Kursi_gerbongId_fkey" FOREIGN KEY ("gerbongId") REFERENCES "Gerbong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_keretaId_fkey" FOREIGN KEY ("keretaId") REFERENCES "Kereta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembelian" ADD CONSTRAINT "Pembelian_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembelian" ADD CONSTRAINT "Pembelian_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "Jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPembelian" ADD CONSTRAINT "DetailPembelian_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPembelian" ADD CONSTRAINT "DetailPembelian_kursiId_fkey" FOREIGN KEY ("kursiId") REFERENCES "Kursi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPembelian" ADD CONSTRAINT "DetailPembelian_gerbongId_fkey" FOREIGN KEY ("gerbongId") REFERENCES "Gerbong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPembelian" ADD CONSTRAINT "DetailPembelian_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "Jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pembelianId_fkey" FOREIGN KEY ("pembelianId") REFERENCES "Pembelian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
