
import useAxiosSecure from '../../../Hooks/UseAxiosSecure';
import UseAuth from '../../../Hooks/UseAuth';
import Swal from 'sweetalert2';
import { useQuery } from '@tanstack/react-query';






const CreateNote = () => {

    const axiosSecure = useAxiosSecure();
    const { user, email } = UseAuth();


      // --- 3) Student notes
      const {
        data: notes = [],
        isLoading: notesLoading,
        refetch: refetchNotes,
      } = useQuery({
        queryKey: ["studentNotes", email],
        queryFn: async () => {
          const res = await axiosSecure.get(`/notes/student/${email}`);
          return res.data;
        },
        enabled: !!email,
      });

    const handleCreateNote = async (e) => {
        e.preventDefault();
        const title = e.target.title.value.trim();
        const description = e.target.description.value.trim();
        if (!title || !description) {
            return Swal.fire("Error", "Please provide title and description", "error");
        }
        try {
            await axiosSecure.post("/notes", {
                email,
                title,
                description,
            });
            Swal.fire("Saved", "Note created", "success");
            e.target.reset();
            refetchNotes();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");
        }
    };

    return (
        <section id="create-note" className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Create a Note</h2>
            <form onSubmit={handleCreateNote} className="space-y-3">
                <div>
                    <label className="label">Email</label>
                    <input className="input input-bordered w-full bg-gray-100" value={email} readOnly />
                </div>
                <div>
                    <label className="label">Title</label>
                    <input name="title" className="input input-bordered w-full" required />
                </div>
                <div>
                    <label className="label">Description</label>
                    <textarea name="description" className="textarea textarea-bordered w-full" rows={4} required />
                </div>
                <div>
                    <button type="submit" className="btn btn-primary">Save Note</button>
                </div>
            </form>
        </section>
    )
}

export default CreateNote