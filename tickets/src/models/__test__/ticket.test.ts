import { Ticket } from "../ticket.model";

it("implements optimistic concurrency control", async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({ price: 20, title: "Concert", userId: "1234" });

    // save the ticket to the database
    await ticket.save();
    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket._id);
    const secondInstance = await Ticket.findById(ticket._id);
    // make two seperate changes to the tickets we fetched
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // save the first fetched ticket
    await firstInstance!.save();
    // save the second fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }

    throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
    const ticket = Ticket.build({ price: 20, title: 'Conert', userId: "1234" });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    ticket.set({ price: 10 });
    await ticket.save();
    expect(ticket.version).toEqual(1);
    ticket.set({ price: 12 });
    await ticket.save();
    expect(ticket.version).toEqual(2);
})