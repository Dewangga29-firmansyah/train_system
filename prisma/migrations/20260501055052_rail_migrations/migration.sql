-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'PELANGGAN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelanggan` (
    `id` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pelanggan_nik_key`(`nik`),
    UNIQUE INDEX `Pelanggan_userId_key`(`userId`),
    INDEX `Pelanggan_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Petugas` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Petugas_userId_key`(`userId`),
    INDEX `Petugas_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kereta` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Kereta_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gerbong` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kuota` INTEGER NOT NULL,
    `kelas` ENUM('EKSEKUTIF', 'EKONOMI') NOT NULL,
    `keretaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Gerbong_keretaId_idx`(`keretaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kursi` (
    `id` VARCHAR(191) NOT NULL,
    `row` INTEGER NOT NULL,
    `seat` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `gerbongId` VARCHAR(191) NOT NULL,

    INDEX `Kursi_gerbongId_idx`(`gerbongId`),
    UNIQUE INDEX `Kursi_gerbongId_row_seat_key`(`gerbongId`, `row`, `seat`),
    UNIQUE INDEX `Kursi_gerbongId_label_key`(`gerbongId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jadwal` (
    `id` VARCHAR(191) NOT NULL,
    `asal` VARCHAR(191) NOT NULL,
    `tujuan` VARCHAR(191) NOT NULL,
    `tanggalBerangkat` DATETIME(3) NOT NULL,
    `tanggalTiba` DATETIME(3) NOT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `keretaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Jadwal_keretaId_idx`(`keretaId`),
    INDEX `Jadwal_asal_idx`(`asal`),
    INDEX `Jadwal_tujuan_idx`(`tujuan`),
    INDEX `Jadwal_tanggalBerangkat_idx`(`tanggalBerangkat`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembelian` (
    `id` VARCHAR(191) NOT NULL,
    `kodeBooking` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'PAID', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `pelangganId` VARCHAR(191) NOT NULL,
    `jadwalId` VARCHAR(191) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pembelian_kodeBooking_key`(`kodeBooking`),
    INDEX `Pembelian_pelangganId_idx`(`pelangganId`),
    INDEX `Pembelian_jadwalId_idx`(`jadwalId`),
    INDEX `Pembelian_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailPembelian` (
    `id` VARCHAR(191) NOT NULL,
    `namaPenumpang` VARCHAR(191) NOT NULL,
    `pembelianId` VARCHAR(191) NOT NULL,
    `kursiId` VARCHAR(191) NOT NULL,
    `gerbongId` VARCHAR(191) NOT NULL,
    `jadwalId` VARCHAR(191) NOT NULL,

    INDEX `DetailPembelian_pembelianId_idx`(`pembelianId`),
    INDEX `DetailPembelian_jadwalId_idx`(`jadwalId`),
    INDEX `DetailPembelian_gerbongId_idx`(`gerbongId`),
    UNIQUE INDEX `DetailPembelian_kursiId_jadwalId_key`(`kursiId`, `jadwalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `metode` VARCHAR(191) NOT NULL DEFAULT 'QRIS',
    `qrImageUrl` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `refundedAt` DATETIME(3) NULL,
    `pembelianId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_pembelianId_key`(`pembelianId`),
    INDEX `Payment_pembelianId_idx`(`pembelianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pelanggan` ADD CONSTRAINT `Pelanggan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Petugas` ADD CONSTRAINT `Petugas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gerbong` ADD CONSTRAINT `Gerbong_keretaId_fkey` FOREIGN KEY (`keretaId`) REFERENCES `Kereta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kursi` ADD CONSTRAINT `Kursi_gerbongId_fkey` FOREIGN KEY (`gerbongId`) REFERENCES `Gerbong`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jadwal` ADD CONSTRAINT `Jadwal_keretaId_fkey` FOREIGN KEY (`keretaId`) REFERENCES `Kereta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembelian` ADD CONSTRAINT `Pembelian_pelangganId_fkey` FOREIGN KEY (`pelangganId`) REFERENCES `Pelanggan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembelian` ADD CONSTRAINT `Pembelian_jadwalId_fkey` FOREIGN KEY (`jadwalId`) REFERENCES `Jadwal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_pembelianId_fkey` FOREIGN KEY (`pembelianId`) REFERENCES `Pembelian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_kursiId_fkey` FOREIGN KEY (`kursiId`) REFERENCES `Kursi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_gerbongId_fkey` FOREIGN KEY (`gerbongId`) REFERENCES `Gerbong`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_jadwalId_fkey` FOREIGN KEY (`jadwalId`) REFERENCES `Jadwal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_pembelianId_fkey` FOREIGN KEY (`pembelianId`) REFERENCES `Pembelian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
