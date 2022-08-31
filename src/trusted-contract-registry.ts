
import { 
    EditedSmartContractTrust,
    OwnershipTransferred, 
    SmartContractRegistered 
} from "../generated/TrustedSmartContractRegistry/TrustedSmartContractRegistry";
import { TrustedSmartContract } from "../generated/schema";

export function handleAddSmartContract (event: SmartContractRegistered): void {
    // start with saving event params
      
    let id = event.params.contractAddress.toHex();

    let trustedContract = TrustedSmartContract.load(id);

    if(!trustedContract) {
        trustedContract = new TrustedSmartContract(id);
    }

    trustedContract.name = event.params.contractName;
    trustedContract.address = id;
    trustedContract.trusted = event.params.trusted;
    trustedContract.lastChangeTime = event.params.registrationDate;
    trustedContract.owner = event.transaction.from.toHex();

    // Entities can be written to the store with `.save()`
    trustedContract.save();
}

export function handleEditSmartContractTrust (event: EditedSmartContractTrust): void {
    // start with saving event params
      
    let id = event.params.contractAddress.toHex();

    let trustedContract = TrustedSmartContract.load(id);

    if(trustedContract) {
        trustedContract.trusted = event.params.trusted;
        trustedContract.lastChangeTime = event.params.modificationDate;
        
        // Entities can be written to the store with `.save()`
        trustedContract.save();
    }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {

    let receipt = event.receipt;
    if(receipt) {
        const id = receipt.contractAddress.toHex();
        if(id){
            let trustedContract = TrustedSmartContract.load(id);
            if(trustedContract) {
                trustedContract.owner = event.params.newOwner.toHex();
                trustedContract.lastChangeTime = event.block.timestamp;
                trustedContract.save();
            }
        }
    }
}

