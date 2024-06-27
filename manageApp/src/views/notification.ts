export function NotificationView() {
  return `<div>
        <dialog id="notification" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md absolute top-0 right-0">
        <h2 class="text-xl font-bold mb-4">Powiadomienia</h2>
        //TU POWIADOMIENIA
        <div class="flex justify-end space-x-2">
          <button id="cancelRegisterButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('notification')?.close()">Zamknij</button>
        </div>`;
}
