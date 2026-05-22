import { createPacket } from "@/lib/form-persistence";
import { redirect } from "next/navigation";

export default function NewPacketPage() {
  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 style={{ marginTop: 0 }}>New intake packet</h2>
      <form
        action={async (formData) => {
          "use server";
          const { packetId } = await createPacket({
            patientName: String(formData.get("patientName") ?? ""),
            dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            email: String(formData.get("email") ?? ""),
            dateOfAccident: String(formData.get("dateOfAccident") ?? ""),
          });
          redirect(`/staff/packets/${packetId}`);
        }}
      >
        <div className="field">
          <label htmlFor="patientName">Patient name</label>
          <input id="patientName" name="patientName" />
        </div>
        <div className="field">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <div className="field">
          <label htmlFor="dateOfAccident">Date of accident</label>
          <input id="dateOfAccident" name="dateOfAccident" type="date" />
        </div>
        <button type="submit" className="btn">
          Create & open packet
        </button>
      </form>
    </div>
  );
}
