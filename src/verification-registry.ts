import { 
    VerificationRegistry, 
    VerifierAdded, 
    VerifierRemoved, 
    VerifierUpdated
} from "../generated/VerificationRegistry/VerificationRegistry"
import { Verifier } from "../generated/schema";
import { store } from "@graphprotocol/graph-ts";


export function handleAddVerifier(event: VerifierAdded): void {
    // start with saving event params
    let contract = VerificationRegistry.bind(event.address);
    let verifier_address = event.params.verifier.toHex();
    let id = event.address.toHex() + '_' + verifier_address;
    let info = event.params.verifierInfo;

    let verifier = Verifier.load(id);

    if(!verifier) {
        verifier = new Verifier(id);
    }

    verifier.name = info.name.toString();
    verifier.did = info.did;
    verifier.url = info.url;
    verifier.signer = info.signer.toHex();
    verifier.address = verifier_address;
    
    // Entities can be written to the store with `.save()`
    verifier.save();
}

export function handleRemoveVerifier(event: VerifierRemoved): void {
    store.remove("Verifier", event.params.verifier.toHex());
}

export function handleUpdateVerifier(event: VerifierUpdated): void {
    
    let verifier_address = event.params.verifier.toHex();
    let verifier = Verifier.load(event.address.toHex() + '_' + verifier_address);
    let info = event.params.verifierInfo;
    
    if(!verifier) {
        verifier = new Verifier(event.address.toHex() + '_' + verifier_address);
    }

    verifier.name = info.name.toString();
    verifier.did = info.did;
    verifier.url = info.url;
    verifier.signer = info.signer.toHex();
    verifier.address = verifier_address;
    
    // Entities can be written to the store with `.save()`
    verifier.save();
}