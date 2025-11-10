import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedNightlyReflection, EncryptedNightlyReflection__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedNightlyReflection")) as EncryptedNightlyReflection__factory;
  const reflectionContract = (await factory.deploy()) as EncryptedNightlyReflection;
  const reflectionContractAddress = await reflectionContract.getAddress();

  return { reflectionContract, reflectionContractAddress };
}

describe("EncryptedNightlyReflection", function () {
  let signers: Signers;
  let reflectionContract: EncryptedNightlyReflection;
  let reflectionContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ reflectionContract, reflectionContractAddress } = await deployFixture());
  });

  it("should have zero entries after deployment", async function () {
    const totalEntries = await reflectionContract.getTotalEntries();
    expect(totalEntries).to.eq(0);
  });

  it("should add a reflection entry with encrypted data", async function () {
    // Prepare test data
    const testContent = "Today was challenging but I learned a lot";
    const stressLevel = 65;
    const achievementLevel = 75;
    const mindsetPositive = true;

    // Convert content to bytes32
    const contentBytes = ethers.toUtf8Bytes(testContent);
    const contentBytes32 = ethers.zeroPadBytes(contentBytes, 32);

    // Encrypt content as ebytes32
    const encryptedContent = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBytes32(contentBytes32)
      .encrypt();

    // Encrypt stress level as euint32
    const encryptedStressLevel = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(stressLevel)
      .encrypt();

    // Encrypt achievement level as euint32
    const encryptedAchievementLevel = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(achievementLevel)
      .encrypt();

    // Encrypt mindset boolean as ebool
    const encryptedMindsetPositive = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBool(mindsetPositive)
      .encrypt();

    // Add the reflection entry
    const tx = await reflectionContract
      .connect(signers.alice)
      .addReflection(
        encryptedContent.handles[0],
        encryptedContent.inputProof,
        encryptedStressLevel.handles[0],
        encryptedStressLevel.inputProof,
        encryptedAchievementLevel.handles[0],
        encryptedAchievementLevel.inputProof,
        encryptedMindsetPositive.handles[0],
        encryptedMindsetPositive.inputProof
      );
    await tx.wait();

    // Verify entry was created
    const totalEntries = await reflectionContract.getTotalEntries();
    expect(totalEntries).to.eq(1);

    const userEntryCount = await reflectionContract.getUserEntryCount(signers.alice.address);
    expect(userEntryCount).to.eq(1);

    const entryExists = await reflectionContract.entryExists(1);
    expect(entryExists).to.be.true;
  });

  it("should retrieve and decrypt reflection entry data", async function () {
    // Prepare test data
    const testContent = "Feeling grateful for today's progress";
    const stressLevel = 30;
    const achievementLevel = 85;
    const mindsetPositive = true;

    // Convert content to bytes32
    const contentBytes = ethers.toUtf8Bytes(testContent);
    const contentBytes32 = ethers.zeroPadBytes(contentBytes, 32);

    // Encrypt all fields
    const encryptedContent = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBytes32(contentBytes32)
      .encrypt();

    const encryptedStressLevel = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(stressLevel)
      .encrypt();

    const encryptedAchievementLevel = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(achievementLevel)
      .encrypt();

    const encryptedMindsetPositive = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBool(mindsetPositive)
      .encrypt();

    // Add the reflection entry
    const tx = await reflectionContract
      .connect(signers.alice)
      .addReflection(
        encryptedContent.handles[0],
        encryptedContent.inputProof,
        encryptedStressLevel.handles[0],
        encryptedStressLevel.inputProof,
        encryptedAchievementLevel.handles[0],
        encryptedAchievementLevel.inputProof,
        encryptedMindsetPositive.handles[0],
        encryptedMindsetPositive.inputProof
      );
    await tx.wait();

    // Retrieve encrypted data
    const encryptedContentHandle = await reflectionContract.getEntryContent(1);
    const encryptedStressLevelHandle = await reflectionContract.getEntryStressLevel(1);
    const encryptedAchievementLevelHandle = await reflectionContract.getEntryAchievementLevel(1);
    const encryptedMindsetHandle = await reflectionContract.getEntryMindset(1);

    // Decrypt the data
    const decryptedContent = await fhevm.userDecryptEbytes32(
      encryptedContentHandle,
      reflectionContractAddress,
      signers.alice
    );

    const decryptedStressLevel = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedStressLevelHandle,
      reflectionContractAddress,
      signers.alice
    );

    const decryptedAchievementLevel = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAchievementLevelHandle,
      reflectionContractAddress,
      signers.alice
    );

    const decryptedMindset = await fhevm.userDecryptEbool(
      encryptedMindsetHandle,
      reflectionContractAddress,
      signers.alice
    );

    // Verify decrypted values
    const decryptedContentString = ethers.toUtf8String(decryptedContent).replace(/\0/g, "");
    expect(decryptedContentString).to.eq(testContent);
    expect(Number(decryptedStressLevel)).to.eq(stressLevel);
    expect(Number(decryptedAchievementLevel)).to.eq(achievementLevel);
    expect(decryptedMindset).to.eq(mindsetPositive);
  });

  it("should allow multiple entries from the same user", async function () {
    const contentBytes = ethers.toUtf8Bytes("First reflection");
    const contentBytes32 = ethers.zeroPadBytes(contentBytes, 32);

    const encryptedContent1 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBytes32(contentBytes32)
      .encrypt();

    const encryptedStress1 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(50)
      .encrypt();

    const encryptedAchievement1 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(60)
      .encrypt();

    const encryptedMindset1 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBool(true)
      .encrypt();

    await reflectionContract
      .connect(signers.alice)
      .addReflection(
        encryptedContent1.handles[0],
        encryptedContent1.inputProof,
        encryptedStress1.handles[0],
        encryptedStress1.inputProof,
        encryptedAchievement1.handles[0],
        encryptedAchievement1.inputProof,
        encryptedMindset1.handles[0],
        encryptedMindset1.inputProof
      );

    const contentBytes2 = ethers.toUtf8Bytes("Second reflection");
    const contentBytes32_2 = ethers.zeroPadBytes(contentBytes2, 32);

    const encryptedContent2 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBytes32(contentBytes32_2)
      .encrypt();

    const encryptedStress2 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(40)
      .encrypt();

    const encryptedAchievement2 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(80)
      .encrypt();

    const encryptedMindset2 = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBool(false)
      .encrypt();

    await reflectionContract
      .connect(signers.alice)
      .addReflection(
        encryptedContent2.handles[0],
        encryptedContent2.inputProof,
        encryptedStress2.handles[0],
        encryptedStress2.inputProof,
        encryptedAchievement2.handles[0],
        encryptedAchievement2.inputProof,
        encryptedMindset2.handles[0],
        encryptedMindset2.inputProof
      );

    const totalEntries = await reflectionContract.getTotalEntries();
    expect(totalEntries).to.eq(2);

    const userEntryCount = await reflectionContract.getUserEntryCount(signers.alice.address);
    expect(userEntryCount).to.eq(2);

    const userEntries = await reflectionContract.getUserEntries(signers.alice.address);
    expect(userEntries.length).to.eq(2);
    expect(userEntries[0]).to.eq(1);
    expect(userEntries[1]).to.eq(2);
  });

  it("should handle edge cases and validation", async function () {
    // Test entry existence check
    const nonExistentEntryExists = await reflectionContract.entryExists(999);
    expect(nonExistentEntryExists).to.be.false;

    // Test getting entry by index bounds
    const userEntryCount = await reflectionContract.getUserEntryCount(signers.alice.address);
    expect(userEntryCount).to.eq(0); // No entries for alice in this test

    // Test zero address edge case (should return 0)
    const zeroAddressCount = await reflectionContract.getUserEntryCount(ethers.ZeroAddress);
    expect(zeroAddressCount).to.eq(0);
  });

  it("should properly track timestamps", async function () {
    const beforeTime = Math.floor(Date.now() / 1000);

    // Add entry
    const encryptedContent = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add64(12345) // Dummy content
      .encrypt();

    const encryptedStress = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add8(50)
      .encrypt();

    const encryptedAchievement = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add8(80)
      .encrypt();

    const encryptedMindset = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBool(true)
      .encrypt();

    await reflectionContract
      .connect(signers.alice)
      .addReflection(
        encryptedContent.handles[0],
        encryptedContent.inputProof,
        encryptedStress.handles[0],
        encryptedStress.inputProof,
        encryptedAchievement.handles[0],
        encryptedAchievement.inputProof,
        encryptedMindset.handles[0],
        encryptedMindset.inputProof
      );

    const afterTime = Math.floor(Date.now() / 1000);

    // Get the entry and check timestamp is reasonable
    const entry = await reflectionContract.getEntry(1);
    expect(entry.timestamp).to.be.at.least(beforeTime);
    expect(entry.timestamp).to.be.at.most(afterTime + 10); // Allow some buffer
    expect(entry.exists).to.be.true;
  });
});

