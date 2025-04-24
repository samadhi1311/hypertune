import { Loader2Icon } from 'lucide-react';

export default function Loader() {
	return (
		<div className='w-full fixed inset-0 z-[999] flex bg-background justify-center items-center h-full'>
			<Loader2Icon className='animate-spin size-8' />
		</div>
	);
}
