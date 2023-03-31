import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

type SimpleDialogProps = {
	title: string;
	close: () => void;
	open: boolean;
};

export function SimpleDialog(
	props: React.PropsWithChildren<SimpleDialogProps>
) {
	return (
		<>
			<Transition
				appear
				show={props.open}
				as={Fragment}>
				<Dialog
					as="div"
					className="z-10"
					onClose={props.close}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0">
						<div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-[2px]" />
					</Transition.Child>

					<div className="fixed inset-0">
						<div className="flex h-full items-center justify-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95">
								<Dialog.Panel className="max-h-96 w-full max-w-md overflow-auto break-all rounded-md border-2 bg-white p-6 align-middle shadow-md">
									<Dialog.Title
										as="h3"
										className="text-2xl font-medium text-black">
										{props.title}
									</Dialog.Title>
									<div className="mt-2">{props.children}</div>

									<div className="mt-4 flex justify-end">
										<button onClick={props.close}>
											OK
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}
