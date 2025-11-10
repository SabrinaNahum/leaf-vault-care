import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedNightlyReflection } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedNightlyReflectionSepolia", function () {
  let signers: Signers;
  let reflectionContract: EncryptedNightlyReflection;
  let reflectionContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const ReflectionDeployment = await deployments.get("EncryptedNightlyReflection");
      reflectionContractAddress = ReflectionDeployment.address;
      reflectionContract = await ethers.getContractAt("EncryptedNightlyReflection", ReflectionDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should add and retrieve a reflection entry", async function () {
    steps = 15;

    this.timeout(4 * 60000);

    // Prepare test data
    const testContent = "Today was a productive day with good progress";
    const stressLevel = 45;
    const achievementLevel = 70;
    const mindsetPositive = true;

    progress("Converting content to bytes32...");
    const contentBytes = ethers.toUtf8Bytes(testContent);
    const contentBytes32 = ethers.zeroPadBytes(contentBytes, 32);

    progress("Encrypting content...");
    const encryptedContent = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBytes32(contentBytes32)
      .encrypt();

    progress("Encrypting stress level...");
    const encryptedStressLevel = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(stressLevel)
      .encrypt();

    progress("Encrypting achievement level...");
    const encryptedAchievementLevel = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .add32(achievementLevel)
      .encrypt();

    progress("Encrypting mindset boolean...");
    const encryptedMindsetPositive = await fhevm
      .createEncryptedInput(reflectionContractAddress, signers.alice.address)
      .addBool(mindsetPositive)
      .encrypt();

    progress(
      `Call addReflection() ReflectionContract=${reflectionContractAddress} signer=${signers.alice.address}...`
    );
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

    progress("Call getTotalEntries()...");
    const totalEntries = await reflectionContract.getTotalEntries();
    expect(totalEntries).to.be.gte(1);

    progress("Call getEntryContent(1)...");
    const encryptedContentHandle = await reflectionContract.getEntryContent(1);
    expect(encryptedContentHandle).to.not.eq(ethers.ZeroHash);

    progress("Call getEntryStressLevel(1)...");
    const encryptedStressLevelHandle = await reflectionContract.getEntryStressLevel(1);
    expect(encryptedStressLevelHandle).to.not.eq(ethers.ZeroHash);

    progress("Call getEntryAchievementLevel(1)...");
    const encryptedAchievementLevelHandle = await reflectionContract.getEntryAchievementLevel(1);
    expect(encryptedAchievementLevelHandle).to.not.eq(ethers.ZeroHash);

    progress("Call getEntryMindset(1)...");
    const encryptedMindsetHandle = await reflectionContract.getEntryMindset(1);
    expect(encryptedMindsetHandle).to.not.eq(ethers.ZeroHash);

    progress("Decrypting content...");
    const decryptedContent = await fhevm.userDecryptEbytes32(
      encryptedContentHandle,
      reflectionContractAddress,
      signers.alice
    );
    const decryptedContentString = ethers.toUtf8String(decryptedContent).replace(/\0/g, "");
    progress(`Clear content: ${decryptedContentString}`);

    progress("Decrypting stress level...");
    const decryptedStressLevel = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedStressLevelHandle,
      reflectionContractAddress,
      signers.alice
    );
    progress(`Clear stress level: ${decryptedStressLevel}`);

    progress("Decrypting achievement level...");
    const decryptedAchievementLevel = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAchievementLevelHandle,
      reflectionContractAddress,
      signers.alice
    );
    progress(`Clear achievement level: ${decryptedAchievementLevel}`);

    progress("Decrypting mindset...");
    const decryptedMindset = await fhevm.userDecryptEbool(
      encryptedMindsetHandle,
      reflectionContractAddress,
      signers.alice
    );
    progress(`Clear mindset: ${decryptedMindset}`);

    // Verify decrypted values match original
    expect(decryptedContentString).to.eq(testContent);
    expect(Number(decryptedStressLevel)).to.eq(stressLevel);
    expect(Number(decryptedAchievementLevel)).to.eq(achievementLevel);
    expect(decryptedMindset).to.eq(mindsetPositive);
  });
});

